import dotenv from 'dotenv';
dotenv.config();
//서버 시작 전에 미리 개발자에게 알려주기
function required(key, defaultValue) {
    const value = process.env[key] || defaultValue;
    if (value == null) {
        throw new Error(`Key ${key} is undefined`);
    }
    return value;
}
export const config = {
    jwt: {
        secretKey: required('JWT_SECRET'),
        expiresInSec: parseInt(required('JWT_EXPIRES_SEC', "172800")),
    },
    host: {
        port: required('PORT')
    },
    cors: {
        allowedOrigin: required('CORS_ALLOW_ORIGIN')
    },
    redis: {
        username: required('REDIS_USERNAME'),
        host: required('REDIS_HOST'),
        port: required('REDIS_PORT'),
        password: required('REDIS_PASSWORD'),
    },
    naverCloud: {
        serviceId: required('NAVER_CLOUD_SERVICE_ID'),
        secretKey: required('NAVER_CLOUD_SECRET_KEY'),
        accessKey: required('NAVER_CLOUD_ACCESS_KEY'),
    },
    db: {
        host: required('DB_HOST')
    },
    kakao: {
        restApi: required('KAKAO_REST_API_KEY')
    },
    coordinate: {
        wgs84: required('COORDINATE_CONVERT_WGS84'),
        grs80: required('COORDINATE_CONVERT_GRS80'),
    }
};
