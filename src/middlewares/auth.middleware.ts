export const protectUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
      token = req.headers.authorization.split(" ")[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;

    console.log(req.cookies.jwt, "Token from request");
    console.log(
      req.headers.authorization,
      "Token from request from authorization"
    );

    if (token === "null" || !token)
      return next(new AppError("You are not logged in please log in", 401));

    const decoded = await promisify(Jwt.verify)(token, process.env.JWT_SECRET);

    console.log(decoded, "Decoded token data");

    const user = await User.findById(decoded.id).select(
      "+passwordChangedAt +password"
    );
    if (!user)
      return next(
        new AppError(
          "The User blongs to this token does not exist anymore",
          401
        )
      );

    if (user.passwordChangedAfter(decoded.iat))
      return next(
        new AppError("Password has been changed. Please login again!", 401)
      );

    // const newToken = signToken(decoded.id, process.env.JWT_EXPIRES_IN_HOUR);
    // res.cookie('jwt', newToken, cookieOptions(req));

    req.user = user;
    next();
  }
);

export const restrictTo = (...roles: string[]) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.originalUrl, req.user);
    if (!roles.includes(req.user?.role ?? "")) {
      console.log(roles, req.user?.role);
      return next(
        new AppError(
          "You do not have the permission to perform this action",
          403
        )
      );
    }
    next();
  });
