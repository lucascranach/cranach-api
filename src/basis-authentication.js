function basisAuthentication(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    const err = new Error('You are not authenticated');

    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    next(err);
  }

  const auth = Buffer.alloc(authHeader.split(' ')[1], 'base64').toString().split(':');
  const username = auth[0];
  const password = auth[1];

  if (username === process.env.ELASTICSEARCH_USERNAME
    && password === process.env.ELASTICSEARCH_PASSWORD) {
    next();
  } else {
    const err = new Error('You are not authenticated');

    res.setHeader('WWW-Authenticate', 'Basic');
    err.status = 401;
    next(err);
  }
}

module.exports = basisAuthentication;
