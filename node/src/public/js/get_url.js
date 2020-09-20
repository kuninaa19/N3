// 기본 URL 가져오기
const getBaseUrl = () => {
    const pathArray = location.href.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    const url = protocol + '//' + host + '/';

    return url;
};