-- Banco de Dados para Gestor Vetsmart
-- Sistema de Gestão Veterinária

-- Tabela de Usuários (Veterinários, Recepcionistas, Administradores)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'vet', -- 'vet', 'admin', 'receptionist'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tutores (Clientes)
CREATE TABLE IF NOT EXISTS tutors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    cpf VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pets (Pacientes)
CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(50) NOT NULL, -- 'Canino', 'Felino', etc.
    breed VARCHAR(100),
    birth_date DATE,
    weight DECIMAL(5,2),
    gender VARCHAR(10), -- 'M', 'F'
    photo_url TEXT,
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Produtos (Estoque)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'Medicamento', 'Ração', 'Cirúrgico'
    sku VARCHAR(50) UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL, -- Preço de Venda
    cost_price DECIMAL(10,2), -- Preço de Custo
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5, -- Para alertas de estoque baixo
    unit VARCHAR(20) DEFAULT 'un',
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Agendamentos (Consultas, Cirurgias, Vacinas)
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    vet_id INTEGER REFERENCES users(id),
    appointment_date TIMESTAMP NOT NULL,
    reason VARCHAR(255),
    type VARCHAR(50) NOT NULL, -- 'consulta', 'vacina', 'cirurgia', 'retorno'
    status VARCHAR(50) DEFAULT 'agendado', -- 'agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Vendas
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- Quem realizou a venda
    tutor_id INTEGER REFERENCES tutors(id), -- Cliente (opcional)
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- 'credito', 'debito', 'pix', 'dinheiro'
    status VARCHAR(50) DEFAULT 'concluido',
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens da Venda
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

-- Tabela de Vacinas Aplicadas (Histórico de Vacinação)
CREATE TABLE IF NOT EXISTS vaccinations (
    id SERIAL PRIMARY KEY,
    pet_id INTEGER REFERENCES pets(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    date_administered DATE NOT NULL,
    next_due_date DATE,
    batch_number VARCHAR(50),
    vet_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização
CREATE INDEX idx_pets_tutor_id ON pets(tutor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_pet_id ON appointments(pet_id);
CREATE INDEX idx_products_name ON products(name);
