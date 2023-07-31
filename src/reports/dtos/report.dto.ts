import { Expose, Transform } from "class-transformer";

export class ReportDto {
  @Expose()
  id: number;
  @Expose()
  price: number;
  @Expose()
  make: string;
  @Expose()
  model: string;
  @Expose()
  year: number;
  @Expose()
  lng: number;
  @Expose()
  lat: number;
  @Expose()
  mileage: number;
  @Expose()
  approved: boolean;

  // obj is the original object that is being transformed
  // in our case the report entity object
  @Transform(({ obj }) => {
    return obj.user.id;
  })
  @Expose()
  userId: number
}