import csv
import os
import requests
from dotenv import load_dotenv
import pymongo

load_dotenv()

API_URL = 'http://localhost:4000'
JUDGING_URL = 'http://localhost:3000'
JWT_SECRET = os.getenv('JWT_SECRET')
MONGO_CONNECTION_STRING = os.getenv("MONGODB_URI")
JUDGING_DB = "tartanhacks-25-judging-dev"

client = pymongo.MongoClient(MONGO_CONNECTION_STRING)
db = client[JUDGING_DB]

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
    delete_judging_database()
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
            prize_response = requests.post(
                f"{API_URL}/prizes",
                json=prize_data,
                headers={"x-access-token": JWT_SECRET}
            )

            print(f"Response for prize creation: {prize_response.status_code} - {prize_response.text}")


if __name__=='__main__':
    create_users(3)
    # create_judges(3)
    # create_projects(3)
    # delete_projects()
    # synchronize()
    # create_sponsors()
    # create_prizes()