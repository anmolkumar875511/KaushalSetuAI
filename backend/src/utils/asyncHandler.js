export default function asyncHandler(request) {
    return function (req, res, next) {
        Promise.resolve(request(req, res, next)).catch(next);
    };
}
