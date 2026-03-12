const zod = require("zod");

exports.signupSchema = zod.object({
    username: zod
        .string().min(3,"Username must be at least 3 characters long"),
    email: zod
        .string()
        .email("Invalid email address"),
    password: zod
        .string().min(6,"Password must be at least 6 characters long")  
});

exports.loginSchema = zod.object({
    email: zod
        .string()
        .email("Invalid email address"),  
    password: zod
        .string().min(6,"Password must be at least 6 characters long")
});

