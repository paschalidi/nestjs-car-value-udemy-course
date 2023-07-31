import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { map, Observable } from "rxjs";
import { plainToInstance } from "class-transformer";

interface ClassConstructor {
  new(...args: any[]): {}
}
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}
export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {
  }

  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(map((data: any) => {
      return plainToInstance(this.dto, data, {
        // remove all the rest of the properties
        // from the DTO that don't have the @Expose decorator
        excludeExtraneousValues: true
      });
    }));
  }
}