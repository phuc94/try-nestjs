import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { GetUser } from '../auth/decorator'
import { JwtGaurd } from '../auth/guard'

@UseGuards(JwtGaurd)
@Controller('users')
export class UserController {
  @Get('me')
  getMe(@GetUser() user: User) {
    return user
  }
}
