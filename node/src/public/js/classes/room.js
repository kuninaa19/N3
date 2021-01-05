//  room/register.js 에서 방 정보를 담는 클래스
class room {
    constructor(hotelName, country, region, location, simpleInfo, introduction, price, roomImageId) {
        this.hotelName = hotelName;
        this.country = country;
        this.region = region;
        this.location = location;
        this.simpleInfo = simpleInfo;
        this.introduction = introduction;
        this.price = price;
        this.roomImageId = roomImageId;
    }
}