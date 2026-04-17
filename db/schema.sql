-- Database schema for ALLFIX Digital Management System

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO roles (name) VALUES ('admin'), ('technician'), ('receptionist') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    brand VARCHAR(50),
    model VARCHAR(50),
    serial_number VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO order_status (name) VALUES 
('recibido'),
('en diagnostico'),
('en reparacion'),
('retrasado'),
('cancelado'),
('terminado'),
('entregado') 
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
    technician_id INTEGER REFERENCES users(id),
    receptionist_id INTEGER REFERENCES users(id),
    status_id INTEGER REFERENCES order_status(id),
    entry_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP,
    total_cost DECIMAL(10, 2) DEFAULT 0.00,
    diagnosis TEXT,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accessories (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
    description VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES service_orders(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
