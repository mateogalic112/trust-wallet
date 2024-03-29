import HttpException from "./HttpException";

class NotFoundException extends HttpException {
  message: string;
  constructor(message: string) {
    super(404, message);
    this.message = message;
  }
}

export default NotFoundException;
