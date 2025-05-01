import csv
import datetime
import jwt
from bson import ObjectId
from bson.errors import InvalidId
from flask import Flask, jsonify, request
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask_cors import CORS
from urllib.parse import unquote

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Database setup
client = MongoClient('mongodb://localhost:27017/')
db = client['nghtout']
collection = db['restaurants']
users_collection = db['users']
groups_collection = db['groups']
rsvp_collection = db['rsvps']
events_collection = db['events']

# CSV import 
if collection.count_documents({}) == 0:
    with open('TA_restaurants_curated.csv', newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        processed_data = []
        for row in reader:
            # Convert numeric fields
            if 'Rating' in row:
                try: row['Rating'] = float(row['Rating'])
                except ValueError: row['Rating'] = None
            if 'Number of Reviews' in row:
                try: row['Number of Reviews'] = int(row['Number of Reviews'])
                except ValueError: row['Number of Reviews'] = 0
            # Convert Reviews from string to array
            if 'Reviews' in row and row['Reviews']:
                try: row['Reviews'] = eval(row['Reviews'])
                except: row['Reviews'] = []
            processed_data.append(row)
        collection.insert_many(processed_data)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = users_collection.find_one({'email': data['email']})  
            if current_user is None:
                return jsonify({'message': 'Token is invalid!'}), 401
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if users_collection.find_one({'email': data['email']}):
        return jsonify({'message': 'Email already exists'}), 400
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    users_collection.insert_one({
        'email': data['email'],
        'password': hashed_password,
        'timestamp': datetime.datetime.utcnow().isoformat()
    })
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Look up user by email
    user = users_collection.find_one({'email': data['email']})

    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = jwt.encode({
        'email': user['email'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token})



@app.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    try:
        # Find user by email
        user = users_collection.find_one({'email': current_user['email']}, {'_id': 0, 'password': 0})

        if not user:
            return jsonify({'message': 'User not found'}), 404

        created_at = user.get('timestamp', 'N/A')
        if created_at != 'N/A':
            try:
                created_at = datetime.datetime.fromisoformat(created_at).strftime("%B %d, %Y")
            except ValueError:
                created_at = 'Not available'

        groups_count = groups_collection.count_documents({'members': current_user['email']})

        return jsonify({
            'email': user.get('email', 'User'),
            'created_at': created_at,
            'groups_count': groups_count
        })

    except Exception as e:
        print("Error in /profile route:", e)  # debug
        return jsonify({'error': 'Internal Server Error'}), 500

@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/restaurants', methods=['POST'])
@token_required
def create_restaurant(current_user):
    try:
        data = request.get_json()
        required_fields = ['Name', 'City', 'Rating', 'Price Range']

        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400

        restaurant = {
            'Name': data['Name'],
            'City': data.get('City', 'N/A'),
            'Cuisine': data.get('Cuisine', 'N/A'),
            'Rating': float(data.get('Rating', 0)),
            'Price Range': data.get('Price Range', 'N/A'),
            'Number of Reviews': int(data.get('Number of Reviews', 0)),
            'URL_TA': data.get('URL_TA', ''),
            'Reviews': data.get('Reviews', [])
        }

        collection.insert_one(restaurant)
        return jsonify({'message': 'Restaurant created successfully'}), 201

    except Exception as e:
        print("Error in create_restaurant:", e)
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/restaurants', methods=['GET'])
@token_required
def get_restaurants(current_user):
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        query = request.args.get('query', '').strip()
        search_filter = {}

        if query:
            search_filter = {"$or": [
                {"Name": {"$regex": query, "$options": "i"}},
                {"City": {"$regex": query, "$options": "i"}}
            ]}

        total_items = collection.count_documents(search_filter)
        restaurants = list(collection.find(search_filter, {
            '_id': 1, 'Name': 1, 'City': 1, 'Cuisine': 1,
            'Rating': 1, 'Price Range': 1, 'Number of Reviews': 1,
            'URL_TA': 1, 'Reviews': 1
        }).skip(per_page * (page - 1)).limit(per_page))

        # Convert ObjectId to string
        for restaurant in restaurants:
            restaurant['_id'] = str(restaurant['_id'])

        response = jsonify(restaurants)
        response.headers['x-total-count'] = str(total_items)
        return response

    except Exception as e:
        print("Error fetching restaurants:", e)  # debug
        return jsonify({'error': str(e)}), 500


@app.route('/restaurants/<string:name>', methods=['GET', 'PUT', 'DELETE'])
@token_required
def manage_restaurant(current_user, name):
    if request.method == 'GET':
        restaurant = collection.find_one({'Name': name}, {'_id': 0})
        return jsonify(restaurant) if restaurant else jsonify({'message': 'Restaurant not found'}), 404
    if request.method == 'PUT':
        result = collection.update_one({'Name': name}, {'$set': request.get_json()})
        return jsonify({'message': 'Restaurant updated successfully'}) if result.matched_count else jsonify({'message': 'Restaurant not found'}), 404
    if request.method == 'DELETE':
        result = collection.delete_one({'Name': name})
        return jsonify({'message': 'Restaurant deleted successfully'}) if result.deleted_count else jsonify({'message': 'Restaurant not found'}), 404

@app.route('/groups', methods=['GET'])
@token_required
def get_groups(current_user):
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))

    query_filter = {'members': current_user['email']}
    total_items = groups_collection.count_documents(query_filter)
    
    groups = list(groups_collection.find(query_filter).skip(per_page * (page - 1)).limit(per_page))
    
    # Convert ObjectId to string for each group
    for group in groups:
        group['_id'] = str(group['_id'])

    response = jsonify(groups)
    response.headers['x-total-count'] = str(total_items)
    return response


@app.route('/groups', methods=['POST'])
@token_required
def create_group(current_user):
    data = request.get_json()
    if not data.get('name') or not data.get('description'):
        return jsonify({'message': 'Group name and description are required'}), 400
    
    event_ids = data.get('events', [])

    group = {
        'name': data['name'],
        'description': data['description'],
        'owner': current_user['email'],
        'members': [current_user['email']],
        'events': event_ids,  # Store event IDs in an array
    }
    groups_collection.insert_one(group)
    return jsonify({'message': 'Group created successfully'}), 201

@app.route('/groups/<string:group_name>', methods=['PUT'])
@token_required
def update_group(current_user, group_name):
    group_name = unquote(group_name)
    data = request.get_json()
    update_data = {}
    if "name" in data: update_data["name"] = data["name"]
    if "description" in data: update_data["description"] = data["description"]
    result = groups_collection.update_one(
        {'name': group_name, 'owner': current_user['email']},  
        {'$set': update_data}
    )
    return jsonify({'message': 'Group updated successfully'}), 200 if result.matched_count else jsonify({'message': 'Group not found or access denied'}), 404

@app.route('/groups/<string:group_name>', methods=['DELETE'])
@token_required
def delete_group(current_user, group_name):
    group_name = unquote(group_name)
    result = groups_collection.delete_one(
        {'name': group_name, 'owner': current_user['email']}
    )
    if result.deleted_count:
        return jsonify({'message': 'Group deleted successfully'}), 200
    else:
        return jsonify({'message': 'Group not found or access denied'}), 404


# EVENT 
@app.route('/events', methods=['POST'])
@token_required
def create_event(current_user):
    try:
        data = request.get_json()
        if not data.get('title') or not data.get('date'):
            return jsonify({'message': 'Title and Date are required'}), 400
            
        restaurant_id = data.get('restaurant_id', '')
        if restaurant_id:
            try:
                if not collection.find_one({'_id': ObjectId(restaurant_id)}):
                    return jsonify({'message': 'Invalid restaurant ID'}), 400
            except InvalidId:
                return jsonify({'message': 'Invalid restaurant ID format'}), 400

        event = {
            'title': data['title'],
            'description': data.get('description', ''),
            'date': datetime.datetime.fromisoformat(data['date']),
            'location': data.get('location', ''),
            'restaurant_id': restaurant_id,
            'owner': current_user['email'],
            'created_at': datetime.datetime.utcnow(),
            'attendees': []
        }
        
        result = events_collection.insert_one(event)
        return jsonify({
            'message': 'Event created successfully',
            '_id': str(result.inserted_id),
            'restaurant_id': restaurant_id  
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rsvp', methods=['POST'])
@token_required
def create_rsvp(current_user):
    try:
        data = request.get_json()
        if not data.get('event_id') or not data.get('status'):
            return jsonify({'message': 'Missing required fields'}), 400
        rsvp_collection.update_one(
            {'email': current_user['email'], 'event_id': data['event_id']},
            {'$set': {'status': data['status'], 'timestamp': datetime.datetime.utcnow()}},
            upsert=True
        )
        event = events_collection.find_one({'_id': ObjectId(data['event_id'])})
        attendees = event.get('attendees', [])
        if data['status'] == 'Going':
            if current_user['email'] not in attendees:
                events_collection.update_one({'_id': ObjectId(data['event_id'])}, {'$push': {'attendees': current_user['email']}})
        else:
            events_collection.update_one({'_id': ObjectId(data['event_id'])}, {'$pull': {'attendees': current_user['email']}})
        return jsonify({'message': 'RSVP updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/rsvp/<string:event_id>', methods=['DELETE'])
@token_required
def delete_rsvp(current_user, event_id):
    result = rsvp_collection.delete_one({'event_id': event_id, 'email': current_user['email']})
    return jsonify({'message': 'RSVP removed successfully'}) if result.deleted_count else jsonify({'message': 'RSVP not found'}), 404

@app.route('/rsvp/<string:event_id>', methods=['GET'])
@token_required
def get_rsvp(current_user, event_id):
    try:
        rsvps = list(rsvp_collection.find({'event_id': event_id}))
        going = [r['email'] for r in rsvps if r.get('status') == 'Going']
        not_going = [r['email'] for r in rsvps if r.get('status') == 'Not Going']
        return jsonify({'going': going, 'notGoing': not_going}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/events', methods=['GET'])
@token_required
def get_events(current_user):
    try:
        events = list(events_collection.find({}))
        for event in events:
            event['_id'] = str(event['_id'])
            event['date'] = event['date'].isoformat() if isinstance(event['date'], datetime.datetime) else event['date']
        return jsonify(events)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events/<string:event_id>', methods=['GET', 'DELETE'])
@token_required
def manage_event(current_user, event_id):
    if request.method == 'GET':
        try:
            try:
                object_id = ObjectId(event_id)
            except Exception:
                return jsonify({'message': 'Invalid event ID format'}), 400

            event = events_collection.find_one({'_id': object_id})
            if event:
                event['_id'] = str(event['_id'])
                event['date'] = event['date'].isoformat() if isinstance(event['date'], datetime.datetime) else event['date']
                return jsonify(event)
            else:
                return jsonify({'message': 'Event not found'}), 404
        except Exception as e:
            print("Error in GET /events/<event_id>:", e)
            return jsonify({'error': str(e)}), 500

    if request.method == 'DELETE':
        try:
            try:
                object_id = ObjectId(event_id)
            except Exception:
                return jsonify({'message': 'Invalid event ID format'}), 400

            event = events_collection.find_one({'_id': object_id})
            if not event:
                return jsonify({'message': 'Event not found'}), 404
            if event['owner'] != current_user['email']:
                return jsonify({'message': 'Unauthorized to delete this event'}), 403

            result = events_collection.delete_one({'_id': object_id})
            rsvp_collection.delete_many({'event_id': event_id})
            return jsonify({'message': 'Event deleted successfully'}), 200 if result.deleted_count else jsonify({'message': 'Event not found'}), 404
        except Exception as e:
            print("Error in DELETE /events/<event_id>:", e)
            return jsonify({'error': str(e)}), 500



@app.route('/events/search', methods=['GET'])
@token_required
def search_events(current_user):
    try:
        query = request.args.get('query', '').strip()
        if not query:
            return jsonify({'message': 'Search query is required'}), 400

        search_filter = {"$or": [
            {"title": {"$regex": query, "$options": "i"}},
            {"description": {"$regex": query, "$options": "i"}},
            {"location": {"$regex": query, "$options": "i"}}
        ]}

        events = list(events_collection.find(search_filter, {
            '_id': 1, 'title': 1, 'description': 1, 'date': 1, 'location': 1, 'restaurant_id': 1
        }))


        for event in events:
            event['_id'] = str(event['_id'])
            event['date'] = event['date'].isoformat() if isinstance(event['date'], datetime.datetime) else event['date']

        return jsonify(events)

    except Exception as e:
        print("Error searching events:", e)  # debug
        return jsonify({'error': 'Internal Server Error'}), 500


if __name__ == '__main__':
    app.run(debug=True)