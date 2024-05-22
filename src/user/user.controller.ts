import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator/get-user.decorator'
import { JwtGuard } from '../auth/guard'
import { EditUserDto } from './dto';
import { UserService } from './user.service';


@Controller('users')
export class UserController {
    constructor(private userService: UserService){}
    //this path should be protected by our jwt strategy
    @UseGuards(JwtGuard)
    @Get('me')
    getMe(@GetUser() user: User, @GetUser('email') email: string){
        return user
    }

    @Patch()
    editUser(
      @GetUser('id') userId: number,
      @Body() dto: EditUserDto,
    ) {
      return this.userService.editUser(userId, dto);
    }
}
