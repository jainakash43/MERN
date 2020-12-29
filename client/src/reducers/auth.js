import { REGISTER_SUCCESS, 
    REGISTER_FAIL,
    USER_LOADED,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    AUTH_ERROR,
    ACCOUNT_DELETED} from '../actions/types';
     
const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    user: null
}

export default function(state = initialState , action){

    const { type, payload } = action;

    switch(type)
    {
        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:{
            localStorage.setItem('token',payload.token);
            return {
                ...state,
                ...payload,
                isAuthenticated:true,
                loading:false
            }}
        case AUTH_ERROR: 
        case LOGIN_FAIL:
        case LOGOUT:
        case ACCOUNT_DELETED:
        case REGISTER_FAIL:{
            localStorage.removeItem('token');
            return {
                ...state,
                token: null,
                isAuthenticated:false,
                loading:false,
            }}
         case USER_LOADED:
             return {
                 ...state,
                 isAuthenticated:true,
                 loading:false,
                 user:payload
             }
            
        default:
            return state;


    }

}