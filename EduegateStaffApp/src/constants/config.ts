export const ENV_CONFIG = {
    local: {
        RootUrl: 'http://localhost:5143/api/appdata',
        SchoolServiceUrl: 'http://localhost:5143/api/school',
        SecurityServiceUrl: 'http://localhost:5143/api/security',
        UserServiceUrl: 'http://localhost:5143/api/useraccount',
        ContentServiceUrl: 'http://localhost:5143/api/content',
        CommunicationServiceUrl: 'http://localhost:5143/api/communication',
    },
    live: {
        RootUrl: 'https://api.pearlschool.org/api/appdata',
        SchoolServiceUrl: 'https://api.pearlschool.org/api/school',
        PowerBIServiceUrl: 'https://api.pearlschool.org/api/PowerBI',
        SecurityServiceUrl: 'https://api.pearlschool.org/api/security',
        UserServiceUrl: 'https://api.pearlschool.org/api/useraccount',
        ContentServiceUrl: 'https://api.pearlschool.org/api/content',
        SignalRhubURL: 'http://chat.pearlschool.org/api/communication',
        CommunicationServiceUrl: 'https://api.pearlschool.org/api/communication',
        ErpUrl: 'https://erp.pearlschool.org/',
        ParentUrl: 'https://parent.pearlschool.org/',
    },
};

export const SELECTED_ENV = 'live'; // Change this to switch environments
export const API_CONFIG = ENV_CONFIG[SELECTED_ENV];
export const TIMEOUT = 30000;

export const STORAGE_KEYS = {
    AUTH_TOKEN: '@auth:access_token',
    REFRESH_TOKEN: '@auth:refresh_token',
    USER_DATA: '@auth:user_data',
    IS_DRIVER: '@app:is_driver',
    BIOMETRIC_ENABLED: '@app:biometric_enabled',
    LANGUAGE: '@app:language',
    THEME_MODE: '@app:theme_mode',
};

export const APP_CONFIG = {
    APP_NAME: 'Eduegate Staff',
    VERSION: '1.0.0',
    BUNDLE_ID: 'com.eduegate.staffapp',
};
