import { Router } from 'express';

import userRoutes from './userRoute';
import ticketRoutes from './ticketRoute';
import clientRoutes from './clientRoute';

const routes = Router();

routes.use('/api/user', userRoutes);
routes.use('/api/tickets', ticketRoutes);
routes.use('/api/clients', clientRoutes);

export default routes;