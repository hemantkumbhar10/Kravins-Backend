// import {Express, Request, Response, NextFunction} from 'express';
// import csrf from 'csurf';



// const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
//     const csrfPro= csrf({ cookie: { httpOnly: true, secure: true } });
//     csrfPro(req, res, next);
//     res.locals._csrf = req.csrfToken();
//     return next();
//   };
  
//   module.exports = csrfProtection;