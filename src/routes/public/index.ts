import { Router } from 'express';
import eventsRouter from './events.routes';
import categoriesRouter from './categories.routes';
import subcategoriesRouter from './subcategories.routes';
import subgenresRouter from './subgenres.routes';
import citiesRouter from './cities.routes';
import webBlocksRouter from './web_blocks.routes';
import waitingListRouter from './event_waiting_list.routes';
import countriesRouter from './countries.routes';
import webSectionsRouter from './web_sections.routes';

const publicRouter = Router();

publicRouter.use('/events', eventsRouter);
publicRouter.use('/categories', categoriesRouter);
publicRouter.use('/subcategories', subcategoriesRouter);
publicRouter.use('/subgenres', subgenresRouter);
publicRouter.use('/cities', citiesRouter);
publicRouter.use('/web-blocks', webBlocksRouter);
publicRouter.use('/waiting-list', waitingListRouter);
publicRouter.use('/countries', countriesRouter);
publicRouter.use('/web-sections', webSectionsRouter);

export default publicRouter;
