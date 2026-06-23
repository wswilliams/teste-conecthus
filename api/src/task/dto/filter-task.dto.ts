import { IsOptional, IsString } from 'class-validator';

export class FilterTaskDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  dateFrom?: string;

  @IsString()
  @IsOptional()
  dateTo?: string;
}
