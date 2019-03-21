import { h, render } from 'preact';
import { ApiApp } from './Api';

render(<ApiApp maxDistance={10000} />, document.body);
