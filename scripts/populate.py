import csv
import os
import requests
from dotenv import load_dotenv
import pymongo
from bson import ObjectId

load_dotenv()

API_URL = "https://dev.backend.tartanhacks.com"
JUDGING_URL = "https://dev.judging.tartanhacks.com"
JWT_SECRET = os.getenv("JWT_SECRET")
MONGO_CONNECTION_STRING = os.getenv("MONGODB_URI")
HELIX_DB = "tartanhacks-25-dev"
JUDGING_DB = "tartanhacks-25-judging-dev"

print(f"MONGO_CONNECTION_STRING: {MONGO_CONNECTION_STRING}")
print(f"HELIX_DB: {HELIX_DB}")
print(f"JUDGING_DB: {JUDGING_DB}")

client = pymongo.MongoClient(MONGO_CONNECTION_STRING, tlsAllowInvalidCertificates=True)
helix_db = client[HELIX_DB]
# judging_db = client[JUDGING_DB]

# Check if directory exists
if not os.path.exists("../data"):
    os.makedirs("../data")


def create_users(n):
    with open("../data/users.csv", mode="w", newline="") as file:
        fieldnames = [
            "admin",
            "judge",
            "company",
            "status",
            "_id",
            "email",
            "createdAt",
            "updatedAt",
            "__v",
            "password",
            "token",
        ]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()

        for i in range(n):
            response = requests.post(
                f"{API_URL}/test-account?status=CONFIRMED",
                headers={"x-access-token": JWT_SECRET},
            )

            if response.status_code == 200:
                user_data = response.json()
                writer.writerow(
                    {
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
                        "token": user_data.get("token"),
                    }
                )

            print(f"Response for user {response.status_code} - {response.text}")


def create_teams():
    with open("../data/users.csv", mode="r") as users_file, open(
        "../data/teams.csv", mode="w", newline=""
    ) as teams_file:
        csv_reader = csv.DictReader(users_file)
        fieldnames = ["_id", "name", "description", "visible", "user_email"]
        writer = csv.DictWriter(teams_file, fieldnames=fieldnames)
        writer.writeheader()

        for row in csv_reader:
            team_data = {
                "name": f"Team {row['email']}",
                "description": "A team created by the script",
                "visible": True,
            }
            team_response = requests.post(
                f"{API_URL}/team/",
                json=team_data,
                headers={"x-access-token": row["token"]},
            )

            if team_response.status_code == 200:
                team_data = team_response.json()
                writer.writerow(
                    {
                        "_id": team_data["_id"],
                        "name": team_data["name"],
                        "description": team_data["description"],
                        "visible": team_data["visible"],
                        "user_email": row["email"],
                    }
                )

            print(
                f"Response for team creation: {team_response.status_code} - {team_response.text}"
            )


def create_projects(n):
    create_users(n)
    create_teams()

    with open("../data/teams.csv", mode="r") as teams_file:
        csv_reader = csv.DictReader(teams_file)
        for row in csv_reader:
            project_data = {
                "name": f"Project for {row['name']}",
                "description": "A project created by the script",
                "team": row["_id"],
                "slides": "http://example.com/slides",
                "video": "http://example.com/video",
                "url": "http://example.com",
                "presentingVirtually": True,
            }
            project_response = requests.post(
                f"{API_URL}/projects",
                json=project_data,
                headers={"x-access-token": JWT_SECRET},
            )

            table_number_response = requests.patch(
                f"{API_URL}/projects/{project_response.json()['_id']}/table-number",
                json={"tableNumber": 1},
                headers={"x-access-token": JWT_SECRET},
            )

            print(
                f"Response for project creation: {project_response.status_code} - {project_response.text}"
            )
            print(
                f"Response for table number assignment: {table_number_response.status_code} - {table_number_response.text}"
            )


def delete_projects():
    # Get projects
    projects_response = requests.get(
        f"{API_URL}/projects", headers={"x-access-token": JWT_SECRET}
    )
    projects = projects_response.json()

    # Delete projects
    for project in projects:
        project_id = project["_id"]
        project_response = requests.delete(
            f"{API_URL}/projects/{project_id}", headers={"x-access-token": JWT_SECRET}
        )
        print(
            f"Response for project deletion: {project_response.status_code} - {project_response.text}"
        )


def create_judges(n):
    create_users(n)

    with open("../data/users.csv", mode="r") as users_file:
        csv_reader = csv.DictReader(users_file)
        judges = []
        for row in csv_reader:
            if row["email"]:
                judges.append(row["email"])

        judge_response = requests.post(
            f"{API_URL}/judges/", json=judges, headers={"x-access-token": JWT_SECRET}
        )

        # Copy users file to judges file using os but only the email and passwords by opening the csv and copying
        with open("../data/users.csv", mode="r") as users_file, open(
            "../data/judges.csv", mode="w", newline=""
        ) as judges_file:
            csv_reader = csv.DictReader(users_file)
            fieldnames = ["email", "password"]
            writer = csv.DictWriter(judges_file, fieldnames=fieldnames)
            writer.writeheader()

            for row in csv_reader:
                writer.writerow({"email": row["email"], "password": row["password"]})

        print(
            f"Response for judge creation: {judge_response.status_code} - {judge_response.text}"
        )


def delete_judging_database():
    client.drop_database(JUDGING_DB)


def synchronize():
    response = requests.get(f"{JUDGING_URL}/api/synchronize")
    print(f"Response for synchronization: {response.status_code} - {response.text}")


def create_sponsors():
    with open("../data/sponsors.csv", mode="r") as sponsors_file:
        csv_reader = csv.DictReader(sponsors_file)
        for row in csv_reader:
            sponsor_data = {
                "name": row["name"],
            }
            sponsor_response = requests.post(
                f"{API_URL}/sponsor",
                json=sponsor_data,
                headers={"x-access-token": JWT_SECRET},
            )

            print(
                f"Response for sponsor creation: {sponsor_response.status_code} - {sponsor_response.text}"
            )


def create_talks():
    # Delete existing talks by dropping table
    with open("../data/talks.csv", mode="r") as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            check_in_data = {
                "name": row["name"],
                "description": row["description"],
                "startTime": int(row["startTime"]),
                "endTime": int(row["endTime"]),
                "points": int(row["points"]),
                "accessLevel": row["accessLevel"],
                "enableSelfCheckIn": row["enableSelfCheckIn"],
            }
            response = requests.post(
                f"{API_URL}/check-in",
                json=check_in_data,
                headers={"x-access-token": JWT_SECRET},
            )
            print(
                f"Response for check-in creation: {response.status_code} - {response.text}"
            )


def create_prizes():
    with open("../data/prizes.csv", mode="r") as prizes_file:
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
                headers={"x-access-token": JWT_SECRET},
            )

            print(
                f"Response for prize creation: {prize_response.status_code} - {prize_response.text}"
            )


def delete_prizes():
    # Get prizes
    prizes_response = requests.get(
        f"{API_URL}/prizes", headers={"x-access-token": JWT_SECRET}
    )
    prizes = prizes_response.json()

    # Delete prizes
    for prize in prizes:
        prize_id = prize["_id"]
        prize_response = requests.delete(
            f"{API_URL}/prizes/{prize_id}", headers={"x-access-token": JWT_SECRET}
        )
        print(
            f"Response for prize deletion: {prize_response.status_code} - {prize_response.text}"
        )


def submit_to_prize(project_id, prize_id):
    url = f"{API_URL}/projects/prizes/enter/{project_id}"
    headers = {"x-access-token": JWT_SECRET}
    params = {"prizeID": prize_id}
    response = requests.put(url, headers=headers, params=params)
    print(
        f"Response for submitting project to prize: {response.status_code} - {response.text}"
    )


# def delete_talks():
#     helix_db.drop_collection("checkin-items")
#
# def delete_checkins():
#     helix_db.drop_collection("checkins")


def check_in_user(user_id, check_in_item_id):
    url = f"{API_URL}/check-in/user"
    headers = {"x-access-token": JWT_SECRET}
    params = {"userID": user_id, "checkInItemID": check_in_item_id}
    response = requests.put(url, headers=headers, params=params)
    print(f"Response for checking in user: {response.status_code} - {response.text}")


# def get_user_id(email):
#     user = helix_db.users.find_one({"email": email})
#     if user is None:
#         return None
#     return user["_id"]
#
# def get_check_in_item_id(name):
#     check_in_item = helix_db["checkin-items"].find_one({"name": name})
#     if check_in_item is None:
#         return None
#     return check_in_item["_id"]


# def get_project_id(name):
#     project = helix_db.projects.find_one({"name": name})
#     if project is None:
#         return None
#     return project["_id"]
#
#
# def get_prize_id(name):
#     prize = helix_db.prizes.find_one({"name": name})
#     if prize is None:
#         return None
#     return prize["_id"]
#
#
# def delete_schedule_items():
#     helix_db.drop_collection("schedule-items")


def create_schedule_items():
    with open("../data/events.csv", mode="r") as events_file:
        csv_reader = csv.DictReader(events_file)
        for row in csv_reader:
            schedule_data = {
                "name": row["name"],
                "description": row["description"],
                "startTime": int(row["startTime"]),
                "endTime": int(row["endTime"]),
                "location": row["location"],
                "lat": 0,
                "lng": 0,
                "platform": "IN_PERSON",
                "platformUrl": "",
            }
            response = requests.post(
                f"{API_URL}/schedule",
                json=schedule_data,
                headers={"x-access-token": JWT_SECRET},
            )
            print(
                f"Response for schedule item creation: {response.status_code} - {response.text}"
            )


def append_shirt_size_to_dietary_restrictions():
    for document in helix_db["profiles"].find():
        dietary_restrictions = document.get("dietaryRestrictions", []) or []
        shirt_size = document.get("shirtSize", "")

        if shirt_size:
            dietary_restrictions.append(f"Shirt size: {shirt_size}")
            print(
                f"Updated {document.get('firstName', '')} with updated dietary restrictions: {dietary_restrictions}"
            )

            result = helix_db["profiles"].update_one(
                {"_id": document["_id"]},
                {
                    "$set": {"dietaryRestrictions": dietary_restrictions}
                },  # Note: not dietary_restrictions
            )
            print(f"Modified {result.modified_count} documents")


def remove_shirt_size_from_dietary_restrictions():
    for document in helix_db["profiles"].find():
        dietary_restrictions = document.get("dietaryRestrictions", []) or []

        # Filter out any entries that start with "Shirt size: "
        filtered_restrictions = [
            r for r in dietary_restrictions if not r.startswith("Shirt size:")
        ]

        if filtered_restrictions != dietary_restrictions:
            print(
                f'Updating {document.get("firstName", "")} - removing shirt size from dietary restrictions'
            )
            print(f"Before: {dietary_restrictions}")
            print(f"After: {filtered_restrictions}")

            result = helix_db["profiles"].update_one(
                {"_id": document["_id"]},
                {"$set": {"dietaryRestrictions": filtered_restrictions}},
            )
            print(f"Modified {result.modified_count} documents\n")


def get_pitt_checkins(event_id):
    # Find all profiles with Pitt email addresses who checked in
    pipeline = [
        {
            "$lookup": {
                "from": "checkins",
                "localField": "_id",
                "foreignField": "user",
                "as": "checkins",
            }
        },
        {
            "$lookup": {
                "from": "profiles",
                "localField": "_id",
                "foreignField": "user",
                "as": "profile",
            }
        },
        {
            "$match": {
                "checkins": {"$elemMatch": {"item": ObjectId(event_id)}},
                "profile.school": "The University of Pittsburgh",
            }
        },
    ]

    results = list(helix_db["users"].aggregate(pipeline))
    print(f"\nFound {len(results)} Pitt students who checked in to event {event_id}")

    # for user in results:
    # print(f"Email: {user['email']}")


def add_judges():
    with open("../data/add_judges.csv", mode="r") as users_file:
        csv_reader = csv.DictReader(users_file)
        judges = []
        for row in csv_reader:
            if row["email"]:
                judges.append(row["email"])

        judge_response = requests.post(
            f"{API_URL}/judges/", json=judges, headers={"x-access-token": JWT_SECRET}
        )

        # Copy users file to judges file using os but only the email and passwords by opening the csv and copying
        with open("../data/users.csv", mode="r") as users_file, open(
                "../data/judges.csv", mode="w", newline=""
        ) as judges_file:
            csv_reader = csv.DictReader(users_file)
            fieldnames = ["email", "password"]
            writer = csv.DictWriter(judges_file, fieldnames=fieldnames)
            writer.writeheader()

            for row in csv_reader:
                writer.writerow({"email": row["email"], "password": row["password"]})

        print(
            f"Response for judge creation: {judge_response.status_code} - {judge_response.text}"
        )


if __name__ == "__main__":
    # create_users(3)
    # create_judges(3)
    # delete_projects()
    # create_projects(10)
    # delete_judging_database()
    # add_judges()
    # synchronize()
    # create_sponsors()
    # delete_checkins()
    # delete_talks()
    # create_talks()
    # delete_prizes()
    # create_prizes()
    # check_in_user(get_user_id("jorey-amber@tartanhacks.com"), get_check_in_item_id("Sponsor Event: AppLovin (Tech Talk/Networking)"))
    # submit_to_prize(get_project_id("Project for Team ealasaid-cyan@tartanhacks.com"), get_prize_id("Making Waves"))
    # delete_schedule_items()
    # create_schedule_items()
    # append_shirt_size_to_dietary_restrictions()
    # remove_shirt_size_from_dietary_restrictions()
    # get_pitt_checkins("67a53838c799260008f91957")
    ...
