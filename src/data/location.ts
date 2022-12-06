import proj4 from 'proj4';
import { getLocations } from '../database/database.js';
import { config } from '../config.js';
import { KoreaLocation, Location } from '../types/location.js';
import { WithId } from 'mongodb';

/* @brief MongoDB로 부터 KoreaLocation 데이터 가져오기
*  @return KoreaLocation 배열 리스트
*/
async function getKoreaAddress():Promise<KoreaLocation[]> {
    return await getLocations().find().toArray();
}

/* @brief 현재 위치 좌표 기준으로 가까운 순으로 행정동(법정동) 60개 가져오기
*  @return Location 배열 리스트
*  @params 
    currentX:현재 위치의 X좌표(WGS)
    currentY:현재 위치의 Y좌표(WGS)
*/
export async function getNearAddressByCoordinate(currentX:string, currentY:string):Promise<Location[]> {
    const grs = convertWGSToGRS(currentX, currentY);
    return await getKoreaAddress()
    .then((address)=>{
        return address.map((data):Location => {
            return {
                address: data.ADMNM,
                directDistance: getDirectDistance(grs![0], grs![1], parseFloat(data.X), parseFloat(data.Y)),
                X: data.X,
                Y: data.Y,
                currentX: parseFloat(currentX), //사용자가 처음 등록한 좌표 정보
                currentY: parseFloat(currentY),
            };;
        }).sort(sortByDistance).slice(0, 60);
    });
}

/* @brief WGS84 좌표를 GRS80 좌표로 변환
*  @return GRS80 좌표
*  @params 
    x: WGS84 x 좌표
    x: WGS84 y 좌표
*/
function convertWGSToGRS(x:string, y:string): number[]|undefined {
    const coorX:number = parseFloat(x);
    const coorY:number = parseFloat(y);
    const wgs84 = config.coordinate.wgs84;
    const grs80 = config.coordinate.grs80;
    if (x && y) {
        const result = proj4(wgs84,grs80, [coorY, coorX]);
        return [result[0], result[1]];
    }
}

/* @brief GRS80 좌표를 WGS84 좌표로 변환하기
*  @return WGS84 좌표
*  @params 
    x: WGS84 x 좌표
    x: WGS84 y 좌표
*/
export function convertGRSToWGS(x:string, y:string):number[]|undefined {
    const coorX:number = parseInt(x);
    const coorY:number = parseInt(y);
    const wgs84 = config.coordinate.wgs84;
    const grs80 = config.coordinate.grs80;
    if (x && y) {
        const result = proj4(grs80, wgs84, [coorX, coorY]);
        return [result[1], result[0]];
    }
}

/* @brief 피타고라스 정의를 이용한 직선거리 계산
*  @return 직선 거리
*  @params 
    x: WGS84 x 좌표
    x: WGS84 y 좌표
*/
function getDirectDistance(x1:number, y1:number, x2:number, y2:number):number {
    const x = getAbsoluteValue(x2 - x1);
    const y = getAbsoluteValue(y2 - y1);
    return Math.sqrt((x * x) + (y * y));
}
function getAbsoluteValue(x:number):number {
    return x < 0 ? x * -1 : x;
}

/* @brief 거리순(directDistance)으로 오름 차순 정렬
*  @return 0,1,-1
*  @params 
    a: 장소1
    b: 장소2
*/
function sortByDistance(a:Location, b:Location):number {
    if (a.directDistance == b.directDistance) {
        return 0;
    }
    return a.directDistance! > b.directDistance! ? 1 : -1;
}