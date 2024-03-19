//Create Model
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace Disbursements.Library.Models.PCF
{
    public class GlSetupModel
    {
        public int Id { get; set; }
        public int LineId { get; set; }
        public string BrCode { get; set; }
        public string Descrip { get; set; }
        public string AcctCode { get; set; }
        public string AcctName { get; set; }
        public bool Active { get; set; }
        public DateTime DateCreated { get; set; }
        public string CreatedBy { get; set; }
        public DateTime LastUpdate { get; set; }
        public string UpdateBy { get; set; }

    }
}

//Create Controller


//bridge to Repo
public IEnumerable<GlSetupModel> GetGlSetup()
{
    return repo.GetGlSetup();
}


//Create Dapper In service
public IEnumerable<GlSetupModel> GetGlSetup()
{
    using (IDbConnection cn = new SqlConnection(work_disb.ConnectionString()))
        return cn.Query<GlSetupModel>("sp_glAccs", new
            {
                Mode = "setup",
            }, 
            commandType: CommandType.StoredProcedure, commandTimeout: 0);
}