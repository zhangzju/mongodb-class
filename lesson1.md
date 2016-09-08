## MongoDB的核心概念

MongoDB是面向文档的数据库。

为什么我们需要MongoDB呢？在关系型数据库的时代，以固定的表结构，数据库结构存储的数据组成了业务逻辑的模型(Model)层的全部数据。遵循SQL语法的各种ORM，例如Eloquent，Rails的Active Record等都已经发展出了优雅并且高效的一套数据处理流程。但是关系型数据库面临着一个很大的瓶颈，那就是扩展性不佳。一个表拥有的字段总是固定的，一个字段的数据类型也是固定的，这样的系统尽管可以很安全，很高效，但是随着数据的大量增加，数据模型的更新，以及分布式的需求，原有的关系型数据库的局限逐渐暴露。

MongoDB的基本思路就是将所有的行(Row)变为文档(Document)，在一个文档中，键值对取代了每一个列对应的记录值。文档相比于行，没有固定的模式，不要求键值对遵循严格的数据类型，非常容易更改数据模型。同时，一个文档具有唯一的id值，这是能够实现分布式的关键。

## MongoDB的独特功能

* 索引
* 直接存储JavaScript的函数和值
* map Reduce
* 文件存储
* 固定集合的日志系统

MongoDB存储的类型是BSON，这是二进制的JSON，JSON目前已经成为了数据交换中不可或缺的格式，BSON使得MongoDB能够将数字，字符串，日期等方便的转换为二进制基础类型而存储到数据库中。

## CURD基本操作

在安装MongoDB之后，启动mongod进程，即可以向进入MySQL命令行一样管理MongoDB数据库。

```sql lite
zhang@ubuntu:~/workspace/mongodb-class$ mongo
MongoDB shell version: 2.6.10
connecting to: test
> use foo
switched to db foo
```

MongoDB可以使用use关键字切换到一个并未创建的数据库，不过此时只是在内存中，只有当数据库有了数据的时候，才会被同步到硬盘。

插入数据时，文档会被先转化成BSON，然后解析是否具有*_id*键，MongoDB不需要指定主键，因为每个文档特有的*_id*键不允许冲突。

```shell
> db.foo.insert({"_id": "001","name": "zhang"})
WriteResult({ "nInserted" : 1 })
> db.foo.insert({"_id": "001","name": "wang"})
WriteResult({
        "nInserted" : 0,
        "writeError" : {
                "code" : 11000,
                "errmsg" : "insertDocument :: caused by :: 11000 E11000 duplicate key error index: foo.foo.$_id_  dup key: { : \"001\" }"
        }
})
> 
```

在插入数据的过程中，MongoDB不会执行我们插入的文档中的语句，因此不必担心会有注入攻击的风险。

查询数据是业务之中使用最多的功能，find的第一个参数决定了要返回那些文档，其形式也就一个文档，说明了要执行的查询细节。

MongoDB使用find来进行查询，查询呢，就是返回一个集合中文档的子集，子集合的范围从0个文档到整个集合。

```shell
> db.foo.find({})
{ "_id" : "001", "name" : "zhang" }
{ "_id" : ObjectId("57d12a5409bc2dbf677c4791"), "age" : 10, "name" : "lu" }
{ "_id" : ObjectId("57d12aa909bc2dbf677c4792"), "age" : 10, "name" : "lu", "addr" : "shenzhen" }
> db.foo.insert({"name":"jack","addr":"hongkong"})
WriteResult({ "nInserted" : 1 })
> db.foo.find({"name":"zhang"})
{ "_id" : "001", "name" : "zhang" }
> db.foo.find({"addr":"hpngkong"})
> db.foo.find({"addr":"hongkong"})
{ "_id" : ObjectId("57d12ad109bc2dbf677c4793"), "name" : "jack", "addr" : "hongkong" }
```

find方法还有第二个参数用于限定返回值的键值，因为返回的信息并非全部都是有用的，例如*_id*字段很多时候对用户并没有什么作用，我们可以在在第二个参数中定制返回值的规则。

```shell
> db.foo.find({},{"_id":0})
{ "name" : "zhang" }
{ "age" : 10, "name" : "lu" }
{ "age" : 10, "name" : "lu", "addr" : "shenzhen" }
{ "name" : "jack", "addr" : "hongkong" }
> db.foo.find({},{"_id":0,"name":0})
{  }
{ "age" : 10 }
{ "age" : 10, "addr" : "shenzhen" }
{ "addr" : "hongkong" }
> 
```

同时，数值的范围选取也可以通过find传入，不过需要采用escape之后的符号来进行数据范围的定义。

```shell
> db.foo.find({"age":{"$gte":10,"$lt":30}})
{ "_id" : ObjectId("57d12a5409bc2dbf677c4791"), "age" : 10, "name" : "lu" }
{ "_id" : ObjectId("57d12aa909bc2dbf677c4792"), "age" : 10, "name" : "lu", "addr" : "shenzhen" }
{ "_id" : ObjectId("57d12f0509bc2dbf677c4794"), "name" : "brown", "age" : 20, "addr" : "Washington" }
> 
```

对于find方法，还有许多内置的函数可以使用。

拥有find之后，删除和更新就可以利用find查到的功能。在MongoDB的命令行中，可以像许多动态语言一样直接给一个临时的变量赋值，以寄存通过find查找出来的结果，然后进行操作。

更新文档内容较多，这点也是为了适应MongoDB的不限定数据类型的特性，包括*$set*，*$inc*等操作一般都是使用ORM来进行。