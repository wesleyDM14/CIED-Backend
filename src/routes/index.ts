import { Router } from 'express';

import userRoutes from './userRoute';
import ticketRoutes from './ticketRoute';
import clientRoutes from './clientRoute';
import procedimentosRoutes from './procedimentoRoute';
import atendimentosRoutes from './atendimentoRoute';

const routes = Router();

routes.use('/api/user', userRoutes);
routes.use('/api/tickets', ticketRoutes);
routes.use('/api/clients', clientRoutes);
routes.use('/api/procedimentos', procedimentosRoutes);
routes.use('/api/atendimentos', atendimentosRoutes);

export default routes;