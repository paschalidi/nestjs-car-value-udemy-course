import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Report } from "./report.entity";
import { CreateReportDto } from "./dtos/create-report.dto";
import { User } from "../users/user.entity";
import { GetEstimateDot } from "./dtos/get-estimate.dot";

@Injectable()
export class ReportsService {
  /**
   * Note: with this bit here nestjs will generate the Repository for us
   * REMEMBER then Repository is a class provided by TypeORM
   * also it has methods like find, findOne, create, save, remove
   */
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {
  }


  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;

    return this.repo.save(report);
  }

  async changeApprovalStatus(id: string, approved: boolean) {
    const report = await this.repo.findOne({ where: { id: parseInt(id) } });
    console.log(report);
    if (!report) {
      throw new NotFoundException("report not found");
    }

    report.approved = approved;
    return this.repo.save(report);
  }

  createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDot) {
    return this.repo.createQueryBuilder()
      .select("AVG(price)", "price")
      .where("make = :make", { make })
      .andWhere("model = :model", { model })
      .andWhere("lng - :lng BETWEEN -5 AND 5", { lng })
      .andWhere("lat - :lat BETWEEN -5 AND 5", { lat })
      .andWhere("year - :year BETWEEN -3 AND 3", { year })
      .andWhere("approved IS TRUE")
      .orderBy("ABS(mileage - :mileage)", "DESC")
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
