import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { BaseModelVm } from '../../shared/base.model';
import { EnumToArray } from '../../shared/utils/enum-to-array';
import { Gender } from '../models/gender.enum';

export class UserVm extends BaseModelVm {
  @ApiModelProperty() email: string;
  @ApiModelProperty() username: string;
  @ApiModelPropertyOptional() fristName?: string;
  @ApiModelPropertyOptional() lastName?: string;
  @ApiModelPropertyOptional() deviceId?: string;
  @ApiModelPropertyOptional() socialLogin: boolean;
  @ApiModelPropertyOptional() socialId?: string;
  @ApiModelPropertyOptional() birthDate?: Date;
  @ApiModelPropertyOptional({ enum: EnumToArray(Gender) }) gender?: Gender;
}
