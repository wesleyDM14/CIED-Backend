import { Router } from 'express';

import userRoutes from './userRoute';
import ticketRoutes from './ticketRoute';

const routes = Router();

routes.use('/api/user', userRoutes);
routes.use('/api/tickets', ticketRoutes);

export default routes;