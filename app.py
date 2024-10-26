import datetime
import hashlib
import jwt
from os.path import join, dirname
from bson import ObjectId
from flask import Flask, render_template, jsonify, request, Response, redirect, session, url_for, make_response, flash
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.secret_key = 'SAMS'
SECRET_KEY = 'SAMS'
dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

try:
    MONGODB_URI = os.environ.get("MONGODB_URI")
    DB_NAME = os.environ.get("DB_NAME")

    mongo = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1000)
    db = mongo[DB_NAME]

    mongo.server_info()  # Memicu exception jika tidak bisa terhubung
    print("Koneksi berhasil ke MongoDB Atlas")
except Exception as e:
    print("ERROR - Tidak dapat terhubung ke MongoDB Atlas:", str(e))

def handle_successful_login(username_receive):
    token = generate_token(username_receive)
    cookie_data = token.decode('utf-8')
    response = make_response(redirect("/"))
    response.set_cookie("mytoken", cookie_data, path="/")
    return response

def generate_token(username_receive):
    payload = {
        "id": username_receive,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=60 * 60 * 10),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token

def convert_to_integer(nilai_kontrak):
    cleaned_value = nilai_kontrak.replace("Rp", "").replace(".", "").strip()
    return int(cleaned_value)

@app.route("/login")
def login():
    return render_template('login.html')

@app.route("/sign_in", methods=["POST"])
def sign_in():
    username_receive = request.form["username"]
    password_receive = request.form["password"]
    pw_hash = hashlib.sha256(password_receive.encode("utf-8")).hexdigest()
    result = db.users.find_one({
        "username": username_receive,
        "password": pw_hash,
    })
    if result:
        return handle_successful_login(username_receive)
    else:
        return jsonify({
            "result": "fail",
            "msg": "We could not find a user with that id/password combination",
        })

@app.route('/sign_out', methods=['GET'])
def sign_out():
    response = make_response(redirect('/login'))
    session.pop('username', None)
    response.set_cookie('session', '', expires=0)
    response.set_cookie('mytoken', '', expires=0)
    return response

@app.route("/")
def home():
    token_receive = request.cookies.get("mytoken")
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        user_info = db.users.find_one({"username": payload.get("id")})
        data = list(db.MarketCustomer.find({}, {"_id": 0}))
        return render_template('index.html', data=data, user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your token has expired"))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="There was problem logging you in"))

# HALAMAN
@app.route("/recap")
def recap():
    token_receive = request.cookies.get("mytoken")
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        user_info = db.users.find_one({"username": payload.get("id")})
        data = list(db.MarketCustomer.find({}, {"_id": 0}))
        am_groups = {}
        for entry in data:
            am = entry['AM']
            kawasan = entry['Kawasan_Industri']
            if am not in am_groups:
                am_groups[am] = set()
            am_groups[am].add(kawasan)
        
        return render_template('recap.html', am_groups=am_groups, data=data, user_info=user_info)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your token has expired"))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="There was problem logging you in"))

@app.route("/visiting")
def visiting():
    token_receive = request.cookies.get("mytoken")
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        user_info = db.users.find_one({"username": payload.get("id")})
        data = list(db.MarketCustomer.find({}, {"_id": 0}))
        user = list(db.users.find({"role" : "am"}, {"_id" : 0, "idAM" : 0, "password" : 0}))
        kawin = list(db.KawasanIndustri.find({}, {'_id' : 0}))
        return render_template('visiting.html',data=data, user_info=user_info, am = user, kawin = kawin)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your token has expired"))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="There was problem logging you in"))

@app.route("/createAM")
def createAM():
    token_receive = request.cookies.get("mytoken")
    try:
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        user_info = db.users.find_one({"username": payload.get("id")})
        data = list(db.users.find({'role' : 'am'}, {"_id": 0}))
        return render_template('createam.html',user_info=user_info, data=data)
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your token has expired"))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="There was problem logging you in"))
# HALAMAN

# EDIT
@app.route("/edit-am/<string:idCode>", methods=['POST'])
def update_am(idCode):
    idCode = int(idCode)
    username = request.form.get("username")
    password = request.form.get("password")
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    
    try: 
        data = {
            "username": username,
            "password": password_hash,
        }
        db.users.update_one(
            {"idAM": idCode},
            {"$set": data}
        )
        flash('AM berhasil diperbarui!', 'success')
    except Exception as e:
        flash('Terjadi kesalahan saat memperbarui AM.', 'danger')
    return redirect(url_for('createAM'))

@app.route("/edit-visiting/<string:id>", methods=['POST'])
def update_visiting(id) :
    token_receive = request.cookies.get("mytoken")
    try :
        payload = jwt.decode(token_receive, SECRET_KEY, algorithms=["HS256"])
        user_info = db.users.find_one({"username": payload.get("id")}, {'_id' : 0})

        role = user_info['role']
        id = int(id)
        visiting = request.form.get('visiting')
        sph = request.form.get('sph')
        status_sph = request.form.get('status_sph')
        nilai_kontrak = request.form.get('nilai_kontrak')
        layanan = request.form.get('layanan')
        skor_am = request.form.get('skor_am')

        try:
            if role == 'sakti' :
                data = {
                    "Visiting" : visiting,
                    "SPH" : sph,
                    "Status_SPH" : status_sph,
                    "Nilai_Kontrak" : convert_to_integer(nilai_kontrak),
                    "Layanan" : layanan,
                    "Skor_AM" : skor_am
                }
            elif role == 'am' : 
                data = {
                    "Visiting" : visiting,
                    "SPH" : sph,
                    "Status_SPH" : status_sph,
                    "Nilai_Kontrak" : convert_to_integer(nilai_kontrak),
                    "Layanan" : layanan,
                }
            db.MarketCustomer.update_one({'No' : id}, {'$set' : data})
            flash("Data berhasil diperbarui!", "success")
        except Exception:
            flash("Data gagal diperbarui!", "danger")
        return redirect(url_for('visiting'))
    except jwt.ExpiredSignatureError:
        return redirect(url_for("login", msg="Your token has expired"))
    except jwt.exceptions.DecodeError:
        return redirect(url_for("login", msg="There was problem logging you in"))
# EDIT

# DELETE
@app.route("/delete-am/<string:idCode>", methods=['POST'])
def delete_am(idCode):
    idCode = int(idCode)
    try:
        db.users.delete_one({"idAM": idCode})
        print('berhasil')
        flash('AM berhasil dihapus!', 'success')
    except Exception as e:
        print('gagal', e)
        flash('Terjadi kesalahan saat menghapus AM.', 'danger')
    return redirect(url_for('createAM'))

@app.route("/delete-visiting/<string:id>", methods=['POST'])
def delete_visiting(id):
    id = int(id)
    try:
        db.MarketCustomer.delete_one({"No": id})
        flash('Data berhasil dihapus!', 'success')
    except Exception as e:
        print('gagal', e)
        flash('Terjadi kesalahan saat menghapus Data.', 'danger')
    return redirect(url_for('visiting'))
# DELETE

# ADD
from flask import request, redirect, url_for, flash
import hashlib

@app.route("/add_am", methods=["POST"])
def add_am():
    username = request.form.get("username")
    password = request.form.get("password")
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    role = 'am'

    existing_user = db.users.find_one({'username': username})
    if existing_user:
        flash("Username sudah digunakan. Silakan pilih username lain.", "warning")
        return redirect(url_for('createAM'))

    last_user_cursor = db.users.find({'role': 'am'}, {"_id": 0}).sort('_id', -1).limit(1)
    last_user = list(last_user_cursor)
    new_id = last_user[0]['idAM'] + 1 if last_user else 1

    # Masukkan data baru ke database
    berita_data = { 
        "idAM": new_id,
        "username": username,
        "password": password_hash,
        "role": role,
    }
    daftar = db.users.insert_one(berita_data)

    if daftar.inserted_id:
        flash("Akun berhasil dibuat!", "success")
    else:
        flash("Gagal membuat akun. Silakan coba lagi.", "danger")
    return redirect(url_for('createAM'))


@app.route("/add_kawasan", methods=['POST'])
def add_kawasan():
    kawin = request.form.get('kawin')
    am = request.form.get('am')
    existing_data = db.KawasanIndustri.find_one({"Kawasan_Industri": kawin})
    if existing_data:
        flash("Data Kawasan Industri ini sudah ada.", "warning")
        return redirect(url_for('visiting'))
    data = {"Kawasan_Industri": kawin, "AM": am}
    add = db.KawasanIndustri.insert_one(data)
    if add.inserted_id:
        flash("Data Kawasan Industri berhasil ditambahkan!", "success")
    else:
        flash("Gagal menambahkan data Kawasan Industri.", "danger")
    return redirect(url_for('visiting'))

@app.route("/add_tenant", methods=['POST'])
def add_tenant():
    kawin = request.form.get('kawin')
    namaTenant = request.form.get('namaTenant')
    bidangUsaha = request.form.get('bidangUsaha')

    existing_data = db.MarketCustomer.find_one({"Tenant": namaTenant})
    if existing_data:
        flash("Data Tenant ini sudah ada.", "warning")
        return redirect(url_for('visiting'))
    
    data_kawin = db.KawasanIndustri.find_one({'Kawasan_Industri' : kawin})

    last_data = db.MarketCustomer.find_one(sort=[("No", -1)])
    if last_data: No = last_data['No'] + 1
    else: No = 1  

    data = {
        "No" : No,
        "Kawasan_Industri": kawin,
        "Tenant" :namaTenant,
        "Field_of_Business" : bidangUsaha,
        "AM": data_kawin['AM'],
        "Visiting" : "-",
        "SPH" : "-",
        "Status_SPH" : "-",
        "Nilai_Kontrak" : "-",
        "Layanan" : "-",
        "Skor_AM" : "-",
    }
    add = db.MarketCustomer.insert_one(data)
    if add.inserted_id:
        flash("Tenant baru berhasil ditambahkan!", "success")
    else:
        flash("Gagal menambahkan Tenant baru.", "danger")
    return redirect(url_for('visiting'))
# ADD

if __name__ == "__main__":
    app.run("0.0.0.0", port=5000, debug=True)