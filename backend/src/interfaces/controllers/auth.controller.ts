import { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../../infrastructure/webserver/middlewares/auth.middleware';

// 1. Zod Schema: Validación estricta de los datos de entrada (Previene Inyección)
const loginSchema = z.object({
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres").max(50),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
});

export class AuthController {
  
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Zod lanzará una excepción si el body tiene scripts, tipos incorrectos o longitud inválida
      const validatedData = loginSchema.parse(req.body);

      // TODO: Aquí invocaríamos el Caso de Uso (Ej. `loginUseCase.execute()`)
      // Por ahora, simulamos una validación en BD
      if (validatedData.username === 'gerente_gnv' && validatedData.password === 'seguridad123') {
        
        const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
        
        // Generar JWT Token
        const token = jwt.sign(
          { id: 'usr_123', role: 'admin' }, 
          secret, 
          { expiresIn: process.env.JWT_EXPIRATION || '8h' }
        );

        res.status(200).json({
          message: 'Autenticación exitosa',
          token,
          user: { username: validatedData.username, role: 'admin' }
        });
        return;
      }

      res.status(401).json({ error: 'Credenciales inválidas' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // ZodError contiene los detalles precisos de qué campo falló
        res.status(400).json({ error: 'Datos de entrada inválidos', details: error.errors });
        return;
      }
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  public getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Si llegamos aquí, el middleware `requireAuth` ya validó el JWT
    res.status(200).json({
      message: 'Acceso autorizado al perfil',
      user: req.user
    });
  };
}
