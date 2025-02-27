"""
Gunicorn configuration file for production deployment
"""

# Gunicorn settings
bind = "0.0.0.0:7700"
workers = 4  # Use (2 * num_cores) + 1 workers for best performance
worker_class = "eventlet"
threads = 2
timeout = 30
keepalive = 5

# Server mechanics
daemon = False  # Don't daemonize in Docker containers
pidfile = "gunicorn.pid"
umask = 0o027
user = None
group = None
tmp_upload_dir = None

# Logging
errorlog = "-"  # Log to stderr
loglevel = "info"
accesslog = "-"  # Log to stdout
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(L)s'

# Process naming
proc_name = "company_dashboard"

# SSL (for production)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Security
limit_request_line = 4096
limit_request_fields = 100
limit_request_field_size = 8190