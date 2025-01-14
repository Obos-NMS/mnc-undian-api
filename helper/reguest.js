module.exports = {
    successLogin: (res, data) => {
        res.status(200).send({ status: 200, data: data.data, message: data.message, token: data.token });
    },
    success: (res, data) => {
        res.status(200).send(data ? { status: 200, ...data } : null);
    },
    invalidToken: (res, error) => {
        const message = (typeof error !== 'string' && error) ? error.message : error;
        res.status(401).send({ status: 401, data: null, message: message });
    },
    notFound: (res, error) => {
        const message = (typeof error !== 'string' && error) ? error.message : error;
        res.status(404).send({ status: 500, data: null, message: message });
    },
    error: (res, error) => {
        const message = (typeof error !== 'string' && error) ? error.message : error;
        res.status(500).send({ status: 500, data: null, message: message });
    }
}