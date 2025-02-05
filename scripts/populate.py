import csv
import os
import requests
from dotenv import load_dotenv
import pymongo

load_dotenv()

API_URL = 'https://dev.backend.tartanhacks.com'
JUDGING_URL = 'http://localhost:3000'
JWT_SECRET = os.getenv('JWT_SECRET')
MONGO_CONNECTION_STRING = os.getenv("MONGODB_URI")
HELIX_DB = "tartanhacks-25-dev"
JUDGING_DB = "tartanhacks-25-judging-dev"

client = pymongo.MongoClient(MONGO_CONNECTION_STRING)
helix_db = client[HELIX_DB]
judging_db = client[JUDGING_DB]

# Check if directory exists
if not os.path.exists("../data"):
    os.makedirs("../data")


def create_users(n):
    with open('../data/users.csv', mode='w', newline='') as file:
        fieldnames = ["admin", "judge", "company", "status", "_id", "email", "createdAt", "updatedAt", "__v", "password", "token"]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()

        for i in range(n):
            response = requests.post(
                f"{API_URL}/test-account?status=CONFIRMED",
                headers={"x-access-token": JWT_SECRET}
            )

            if response.status_code == 200:
                user_data = response.json()
                writer.writerow({
                    "admin": user_data.get("admin", False),
                    "judge": user_data.get("judge", False),
                    "company": user_data.get("company", None),
                    "status": user_data.get("status", "CONFIRMED"),
                    "_id": user_data.get("_id"),
                    "email": user_data.get("email"),
                    "createdAt": user_data.get("createdAt"),
                    "updatedAt": user_data.get("updatedAt"),
                    "__v": user_data.get("__v", 0),
                    "password": user_data.get("password"),
                    "token": user_data.get("token")
                })

            print(f"Response for user {response.status_code} - {response.text}")


def create_teams():
    with open('../data/users.csv', mode='r') as users_file, open('../data/teams.csv', mode='w', newline='') as teams_file:
        csv_reader = csv.DictReader(users_file)
        fieldnames = ["_id", "name", "description", "visible", "user_email"]
        writer = csv.DictWriter(teams_file, fieldnames=fieldnames)
        writer.writeheader()

        for row in csv_reader:
            team_data = {
                "name": f"Team {row['email']}",
                "description": "A team created by the script",
                "visible": True
            }
            team_response = requests.post(
                f"{API_URL}/team/",
                json=team_data,
                headers={"x-access-token": row['token']}
            )

            if team_response.status_code == 200:
                team_data = team_response.json()
                writer.writerow({
                    "_id": team_data["_id"],
                    "name": team_data["name"],
                    "description": team_data["description"],
                    "visible": team_data["visible"],
                    "user_email": row["email"]
                })

            print(f"Response for team creation: {team_response.status_code} - {team_response.text}")


def create_projects(n):
    create_users(n)
    create_teams()

    with open('../data/teams.csv', mode='r') as teams_file:
        csv_reader = csv.DictReader(teams_file)
        for row in csv_reader:
            project_data = {
                "name": f"Project for {row['name']}",
                "description": "A project created by the script",
                "team": row["_id"],
                "slides": "http://example.com/slides",
                "video": "http://example.com/video",
                "url": "http://example.com",
                "presentingVirtually": True
            }
            project_response = requests.post(
                f"{API_URL}/projects",
                json=project_data,
                headers={"x-access-token": JWT_SECRET}
            )

            print(f"Response for project creation: {project_response.status_code} - {project_response.text}")


def delete_projects():
    # Get projects
    projects_response = requests.get(f"{API_URL}/projects", headers={"x-access-token": JWT_SECRET})
    projects = projects_response.json()

    # Delete projects
    for project in projects:
        project_id = project["_id"]
        project_response = requests.delete(f"{API_URL}/projects/{project_id}", headers={"x-access-token": JWT_SECRET})
        print(f"Response for project deletion: {project_response.status_code} - {project_response.text}")


def create_judges(n):
    create_users(n)

    with open('../data/users.csv', mode='r') as users_file:
        csv_reader = csv.DictReader(users_file)
        judges = []
        for row in csv_reader:
            if row['email']:
                judges.append(row['email'])

        judge_response = requests.post(
            f"{API_URL}/judges/",
            json=judges,
            headers={"x-access-token": JWT_SECRET}
        )

        # Copy users file to judges file using os but only the email and passwords by opening the csv and copying
        with open('../data/users.csv', mode='r') as users_file, open('../data/judges.csv', mode='w', newline='') as judges_file:
            csv_reader = csv.DictReader(users_file)
            fieldnames = ["email", "password"]
            writer = csv.DictWriter(judges_file, fieldnames=fieldnames)
            writer.writeheader()

            for row in csv_reader:
                writer.writerow({
                    "email": row["email"],
                    "password": row["password"]
                })


        print(f"Response for judge creation: {judge_response.status_code} - {judge_response.text}")


def delete_judging_database():
    client.drop_database(JUDGING_DB)


def synchronize():
    response = requests.get(f"{JUDGING_URL}/api/synchronize")
    print(f"Response for synchronization: {response.status_code} - {response.text}")


def create_sponsors():
    with open('../data/sponsors.csv', mode='r') as sponsors_file:
        csv_reader = csv.DictReader(sponsors_file)
        for row in csv_reader:
            sponsor_data = {
                "name": row["name"],
            }
            sponsor_response = requests.post(
                f"{API_URL}/sponsor",
                json=sponsor_data,
                headers={"x-access-token": JWT_SECRET}
            )

            print(f"Response for sponsor creation: {sponsor_response.status_code} - {sponsor_response.text}")


def create_talks():
    # Delete existing talks by dropping table
    with open('../data/talks.csv', mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            check_in_data = {
                "name": row["name"],
                "description": row["description"],
                "startTime": int(row["startTime"]),
                "endTime": int(row["endTime"]),
                "points": int(row["points"]),
                "accessLevel": row["accessLevel"],
                "enableSelfCheckIn": row["enableSelfCheckIn"]
            }
            response = requests.post(
                f"{API_URL}/check-in",
                json=check_in_data,
                headers={"x-access-token": JWT_SECRET}
            )
            print(f"Response for check-in creation: {response.status_code} - {response.text}")


def create_prizes():
    with open('../data/prizes.csv', mode='r') as prizes_file:
        csv_reader = csv.DictReader(prizes_file)
        for row in csv_reader:
            prize_data = {
                "name": row["name"],
                "description": row["description"],
                "eligibility": row["eligibility"],
                "sponsorName": row["sponsorName"],
            }
            if "requiredTalk" in row:
                prize_data["requiredTalk"] = row["requiredTalk"]
            prize_response = requests.post(
                f"{API_URL}/prizes",
                json=prize_data,
                headers={"x-access-token": JWT_SECRET}
            )

            print(f"Response for prize creation: {prize_response.status_code} - {prize_response.text}")


def delete_prizes():
    # Get prizes
    prizes_response = requests.get(f"{API_URL}/prizes", headers={"x-access-token": JWT_SECRET})
    prizes = prizes_response.json()

    # Delete prizes
    for prize in prizes:
        prize_id = prize["_id"]
        prize_response = requests.delete(f"{API_URL}/prizes/{prize_id}", headers={"x-access-token": JWT_SECRET})
        print(f"Response for prize deletion: {prize_response.status_code} - {prize_response.text}")


def submit_to_prize(project_id, prize_id):
    url = f"{API_URL}/projects/prizes/enter/{project_id}"
    headers = {
        "x-access-token": JWT_SECRET
    }
    params = {
        "prizeID": prize_id
    }
    response = requests.put(url, headers=headers, params=params)
    print(f"Response for submitting project to prize: {response.status_code} - {response.text}")


def delete_checkins():
    helix_db.drop_collection("checkins")


def check_in_user(user_id, check_in_item_id):
    url = f"{API_URL}/check-in/user"
    headers = {
        "x-access-token": JWT_SECRET
    }
    params = {
        "userID": user_id,
        "checkInItemID": check_in_item_id
    }
    response = requests.put(url, headers=headers, params=params)
    print(f"Response for checking in user: {response.status_code} - {response.text}")


def get_user_id(email):
    user = helix_db.users.find_one({"email": email})
    if user is None:
        return None
    return user["_id"]

def get_check_in_item_id(name):
    check_in_item = helix_db["checkin-items"].find_one({"name": name})
    if check_in_item is None:
        return None
    return check_in_item["_id"]


def get_project_id(name):
    project = helix_db.projects.find_one({"name": name})
    if project is None:
        return None
    return project["_id"]


def get_prize_id(name):
    prize = helix_db.prizes.find_one({"name": name})
    if prize is None:
        return None
    return prize["_id"]


if __name__=='__main__':
    # create_users(3)
    # create_judges(3)
    # create_projects(3)
    # delete_projects()
    # delete_judging_database()
    # synchronize()
    # create_sponsors()
    # create_talks()
    # delete_checkins()
    delete_prizes()
    create_prizes()
    # check_in_user()
    # submit_to_prize()
    # check_in_user(get_user_id("deny-brown@tartanhacks.com"), get_check_in_item_id("Talk 1"))
    # submit_to_prize(get_project_id("Project for Team deny-brown@tartanhacks.com"), get_prize_id("Best Use of AI"))
    ...
