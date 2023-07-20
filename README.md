# Meteo by Grandasse

## How to use
- Install python requirements : `pip install -r requirements.txt`.
- Run the app : `flask run -h localhost -p 8080 --debug` or `python app.py`.
- Access `http://localhost:8080/` with your browser.

## Running it with apache mod_wsgi
- install mod_wsgi : `apt update && apt install libapache2-mod-wsgi-py3`
- You need to modify some path :
    - in `apache/vhost.conf`:
        - `meteo.domain.tld` should be replace by a dedicated subdomain
        - `/app/previsionnasse/.venv` should be replace by the path of your venv.
        - Each occurence of `/app/previsionnasse` should be replace by the path of the project.
- copy the example file `apache/vhost.conf` into your apache sites folder.
- restart apache

