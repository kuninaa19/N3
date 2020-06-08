//  room/register.js 에서 방 정보를 담는 클래스
class room {
    constructor(name,country,region,location,simple_info,intro_info,value,image) {
        this._name = name;
        this._country = country;
        this._region = region;
        this._location = location;
        this.simpleInfo=simple_info;
        this.introInfo=intro_info;
        this._value = value;
        this._image = image;
    }
}