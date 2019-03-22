import { h } from 'preact';
import { BASE_URL } from '../../config';

export const Header = () => (
    <header class="header">
        <img
            class="header__logo"
            src={`${BASE_URL}/assets/logo.svg`}
            width="42"
            height="48"
        />
        <h1 class="header__text">Big Island Buses</h1>
    </header>
);
