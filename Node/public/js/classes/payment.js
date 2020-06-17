//  room/reservation.js 에서 결제 정보를 담는 클래스
class paymentInfo {
    constructor(hotel_name,price,date,day,message) {
        this.hotel_name = hotel_name;
        this.price = price;
        this.date = date;
        this.day=day;
        this.message=message;
    }
}