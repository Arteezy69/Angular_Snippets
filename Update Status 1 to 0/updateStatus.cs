//Create Controller

//Create Repository
 public void UpdateGlAccs(IEnumerable<GlSetupModel> model)
        {
            repo.UpdateGlAccs(model);
        }

//Create Service
public void UpdateGlAccs(IEnumerable<GlSetupModel> model)
        {

            try
            {
                work_disb.BeginTran();

                foreach (var item in model)
                {
                    var record = work_disb.PCFAcctBranches.Find(x => x.Id == item.Id && x.BrCode == item.BrCode);

                    record.LastUpdate = DateTime.Now;
                    record.UpdateBy = userCode;
                    record.Active = false;

                    work_disb.Save();
                }
                work_disb.Commit();
            }
            catch (Exception ex)
            {
                throw ex;
            }

        }