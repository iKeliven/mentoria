import jwt from 'jsonwebtoken';

export function autenticar(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ status: 'ERRO', mensagem: 'Token nao fornecido' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mentorai-secret');
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ status: 'ERRO', mensagem: 'Token invalido' });
  }
}

export function autorizar(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario.perfil)) {
      return res.status(403).json({ status: 'ERRO', mensagem: 'Sem permissao' });
    }
    next();
  };
}
