const fs = require("fs");
var Jimp = require("jimp");
const Request = require("@helper/reguest");

const fileserver = process.env.NEWFILESERVER;

const filePaths = {
  raffle_prize: '/raffle-prize/',
  company_logo: '/company-logo/',
};
exports.filePath = filePaths;

const getDestUploadFile = (code) => {
  const masterPath = 'public/storage/uploads';
  const path = `${masterPath}${filePaths[code] || ''}`;
  return path;
};
exports.getDestUploadFile = getDestUploadFile;

exports.getFileUrl = (code) => {
  const url = (fileserver ?? '') + '/storage/uploads';
  const path = `${url}${filePaths[code] || ''}`;
  return path;
};
// exports.getFileUrl = getFileUrl;

exports.checkFile =
  ({ name, required, allow = [], multi = false }) =>
    (req, res, next) => {
      const validate = (file, index) => {
        if (req.files && file) {
          const { mimetype } = file;
          if (allow.length != 0) {
            var valid = allow.find((e) => mimetype.includes(e));
            if (!valid)
              throw {
                type: "field",
                path: name,
                value: null,
                msg: `Not supported file extension`,
                location: "files",
              };
          }
          if (!req.file) req.file = {};
          if (multi) {
            if (!req.file[name]) req.file[name] = [];
            if (file.fieldname.includes(name)) req.file[name].push(file);
          } else req.file[name] = file;
        } else {
          if (required)
            throw {
              type: "field",
              path: name,
              value: null,
              msg: `Field ${name} is required`,
              location: "files",
            };
        }
      };
      try {
        if (!multi) {
          var file = req.files?.find((e) => e.fieldname == name);
          validate(file);
        } else {
          for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            validate(file, i);
          }
        }
        next();
      } catch (error) {
        if (file?.path) fs.unlinkSync(file?.path);
        Request.error(res, 'Bad Request');
      }
    };

exports.saveImage = (file, name, dir) => {
  if (!file) throw "Image is empty";
  const mimetype = file.mimetype;
  const ext = mimetype.split("/")[1];
  name = name?.replace(/\W/g, "-");
  const pathname = getDestUploadFile(dir);
  const filename = `${name ?? new Date().getTime()}.${ext}`;
  console.log(pathname, "<<<");
  const savePath = `${pathname}/${filename}`;
  this.createPath(pathname);
  Jimp.read(file.path, (err, lenna) => {
    if (err) throw err;
    lenna
      .quality(60) // set JPEG quality
      .write(savePath, (err) => {
        if (!err) fs.unlinkSync(file.path);
      }); // save
  });
  return filename;
};

exports.saveFile = (file, name, dir) => {
  if (!file) throw "File is empty";
  const mimetype = file.mimetype;
  const ext = mimetype.split("/")[1];
  name = name?.replace(/\W/g, "-");
  const pathname = getDestUploadFile(dir);
  const filename = `${name ?? new Date().getTime()}.${ext}`;

  const savePath = `${pathname}/${filename}`;
  this.createPath(pathname);
  fs.renameSync(file.path, savePath);
  return savePath.replace("public/", "");
};

exports.createPath = (pathname) => {
  const tempPath = [];

  pathname.split("/").forEach((path) => {
    tempPath.push(path);
    if (!fs.existsSync(tempPath.join("/"))) fs.mkdirSync(tempPath.join("/"));
  });
};

const units = ["bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

exports.niceBytes = (x) => {
  let l = 0,
    n = parseInt(x, 10) || 0;

  while (n >= 1024 && ++l) {
    n = n / 1024;
  }

  return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + units[l];
};

exports.readFileExcel = (name) => (req, res, next) => {
  const readXlsxFile = require("read-excel-file/node");
  const fs = require("fs");
  try {
    var file = req.file[name];
    if (file)

      readXlsxFile(file.path).then((rows) => {
        let column = rows.splice(0, 1)[0];
        const datas = rows.filter((e) => e[0]);
        var newData = datas.map((row) => {
          let rowAsObject = {};
          row.map((cell, index) => {
            rowAsObject[column[index]] = cell ? `${cell}` : null;
          });
          return rowAsObject;
        });
        fs.unlinkSync(file.path);
        req.body[name] = newData;
        req.body[`column_${name}`] = column;
        next();
      });
  } catch (error) {
    console.log(error);
    Request.error(res, error);
  }
};