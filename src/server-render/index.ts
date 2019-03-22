import api from './api';
import pages from './pages';

api()
    .then(pages)
    .catch(console.error);
