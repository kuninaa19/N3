//  room/register.js 에서 방 정보를 담는 클래스
class room {
    constructor(name,country,region,location,simple_info,intro_info,value,image) {
        this.name = name;
        this.country = country;
        this.region = region;
        this.location = location;
        this.simpleInfo=simple_info;
        this.introInfo=intro_info;
        this.value = value;
        this.image = image;
    }
}