"use strict";
class Password {
    constructor() {
        this.def = verify(password, String);
        this.Boolean = SCryptUtil.check(password, hash);
        this.toString = () => "<PASSWORD-HASH>";
    }
    require(hash, startsWith = ("$s0$")) { }
}
object;
Password;
{
    def;
    fromHash(hash, String);
    Password = Password(hash);
    def;
    fromPlainText(password, String);
    Password = Password(SCryptUtil.scrypt(password, 1 << 14, 8, 2));
    implicit;
    val;
    PasswordFormat: Format[Password] = valueFormat(fromHash)(_.hash);
}
