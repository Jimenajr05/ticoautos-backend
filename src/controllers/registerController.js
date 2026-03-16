const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Controlador para registrar un nuevo usuario
const register = async (req, res) => {

    // Obtiene los datos enviados desde el body
    const { name, lastName, age, phone, email, password } = req.body;

    // Valida que todos los campos obligatorios estén presentes
    if (!name || !lastName || !age || !phone || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }  

    // Verifica que el usuario tenga al menos 18 años
    if (age < 18) {
        return res.status(400).json({ message: 'You must be at least 18 years old to register' });
    }

    // Verifica que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Verifica que exista la clave secreta para generar el JWT
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    try {
        // Busca si ya existe un usuario con ese email
        const existingUser = await User.findOne({ email: email.toLowerCase(). trim() });

        // Si el email ya está registrado
        if (existingUser) {
            return res.status(409).json({ message: 'Email already in use' });
        }   

        // Encripta la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Obtiene la ruta de la imagen de perfil si se subió una
        const profileImage = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : null;

        // Crea el nuevo usuario en la base de datos
        const user = await User.create({
            name: name.trim(),
            lastName: lastName.trim(),
            age,
            phone: phone.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            profileImage
        });

        // Genera el token JWT para autenticación
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Respuesta exitosa con token y datos del usuario
        return res.status(201).json({ 
            message: 'User registered successfully',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                lastName: user.lastName,
                age: user.age,
                phone: user.phone,
                email: user.email,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        // Maneja el error si el email ya existe (error de MongoDB)
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Email already in use' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Error registering user' });
    }
};

module.exports = register;