import pymongo
import python_dotenv
import os

# load env variables
python_dotenv.load_dotenv("../.env")

MONGO_CONNECTION_STRING = os.getenv("MONGODB_URI")
# Project Database - Change to tartanhacks-25
TARTANHACKS_DB = "tartanhacks-24"

# Output file
PROJECT_FILE = "24_projects.csv"

# Prizes to consider
# The script will only write projects that have submitted to at least one of these prizes
# Leave empty to consider all prizes
PRIZES_TO_CONSIDER = ["PLS Logistics Prize", "Ripple XRP Ledger Prize"]

# connect to mongo
client = pymongo.MongoClient(MONGO_CONNECTION_STRING)
db = client[TARTANHACKS_DB]

def load_project_info():
    collection = db["projects"]
    pipeline = [
        {
            "$lookup": {
                "from": "teams",
                "localField": "team",
                "foreignField": "_id",
                "as": "team_info"
            }
        },
        {
            "$unwind": {
                "path": "$team_info",
                "preserveNullAndEmptyArrays": True
            }
        },
        {
            "$lookup": {
                "from": "prizes",
                "localField": "prizes",
                "foreignField": "_id",
                "as": "prizes_info"
            }
        },
        {
            "$lookup": {
                "from": "users",
                "localField": "team_info.members",
                "foreignField": "_id",
                "as": "team_info.members"
            }
        },
        {
            "$project": {
                "_id": 0,
                "team": 0,
                "name": 1,
                "description": 1,
                "url": 1,
                "slides": 1,
                "video": 1,
                "team": 1,
                "prizes": 1,
                "team_name": "$team_info.name",
                "prizes": "$prizes_info",
            }
        },
    ]

    projects = collection.aggregate(pipeline)

    # write to CSV
    import csv
    with open(PROJECT_FILE, "w") as f:
        fields = ["name", "description", "url", "slides", "video", "team_name", "prizes_of_interest"]
        writer = csv.DictWriter(
            f,
            fieldnames=fields
        )
        writer.writeheader()

        for proj in list(projects):
            submitted_to_prizes_to_consider = False
            proj_cleaned = {}

            for field in fields:
                if field == "prizes_of_interest":
                    prizes = [prize["name"] for prize in proj["prizes"]]
                    if PRIZES_TO_CONSIDER:
                        prizes = filter(lambda x: x in PRIZES_TO_CONSIDER, prizes)

                    if prizes:
                        submitted_to_prizes_to_consider = True

                    proj_cleaned[field] = f"\"{', '.join(prizes)}\""
                elif field not in proj:
                    proj_cleaned[field] = None
                else:
                    proj_cleaned[field] = \
                        f"\"{proj[field]}\"" if "," in proj[field] else proj[field]

            if not submitted_to_prizes_to_consider:
                continue
                
            writer.writerow(proj_cleaned)

if __name__ == "__main__":
    load_project_info()
