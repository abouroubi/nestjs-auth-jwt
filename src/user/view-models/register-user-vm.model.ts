import { ApiModelProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { LoginVm } from '../../auth/view-models/login-vm.model';
import { Gender } from '../models/gender.enum';
import { EnumToArray } from '../../shared/utils/enum-to-array';

export class RegisterUserVm extends LoginVm {
  @ApiModelProperty() firstName?: string;

  @ApiModelProperty() lastName?: string;

  @ApiModelProperty()
  @Type(() => Date)
  birthDate?: Date;

  @ApiModelProperty({ enum: EnumToArray(Gender) })
  @IsEnum(Gender)
  @Transform(value => Gender[value], { toClassOnly: true })
  gender?: Gender;
}
