from flask import Flask, send_from_directory
import os
from app import create_app

app = create_app()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    # If the path is a real file inside web-build, serve the file
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    
    # Otherwise, hand it over to React Router by serving index.html
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=PORT)