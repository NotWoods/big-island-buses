import { h, hydrate } from 'preact';
import { ApiApp } from './Api';

const root = document.getElementById('root')!;

hydrate(<ApiApp maxDistance={10000} />, root);
