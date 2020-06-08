//  room/register.js 에서 방 정보를 담는 클래스
class room {
    constructor(name,country,region,location,simple_info,host_name,intro_info,image,value) {
        this.simpleInfo=simple_info;
        this.hostName=host_name;
        this.introInfo=intro_info;
        this._name = name;
        this._country = country;
        this._region = region;
        this._location = location;
        this._simple_info = simple_info;
        this._host_name = host_name;
        this._intro_info = intro_info;
        this._image = image;
        this._value = value;
    }
}