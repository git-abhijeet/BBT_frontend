import { createStore } from 'redux';

const initialState = {
    user: null,
};

function reducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        default:
            return state;
    }
}

export const store = createStore(reducer);