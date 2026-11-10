import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import PageButtonsForm from "@/components/features/portfolio/page-forms/PageButtonsForm";
import PageWorkExperienceForm from "@/components/features/portfolio/page-forms/PageWorkExperienceForm";
import PageLinksForm from "@/components/features/portfolio/page-forms/PageLinksForm";
import PageSettingsForm from "@/components/features/portfolio/page-forms/PageSettingsForm";
import { WorkExperience } from "@/models/WorkExperience";
import { connectToDatabase } from "@/lib/mongoClient";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PageSummaryForm from "@/components/features/portfolio/page-forms/PageSummaryForm";
import PageRolesForm from "@/components/features/portfolio/page-forms/PageRolesForm";
import PageSkillsForm from "@/components/features/portfolio/page-forms/PageSkillsForm";
import PageEducationForm from "@/components/features/portfolio/page-forms/PageEducationForm";
import { Education } from "@/models/Education";
import { Page } from "@/models/Page";
import { Project } from "@/models/Project";
import PageProjectForm from "@/components/features/portfolio/page-forms/PageProjectForm";
import AccountHeader from "@/components/layout/AccountHeader";

export default async function AccountPage(props) {
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);
  let desiredUsername = searchParams?.desiredUsername ? String(searchParams.desiredUsername) : null;

  if (!session) {
    return redirect('/');
  }

  await connectToDatabase();

  const page = await Page.findOne({ owner: session?.user?.email });

  if (desiredUsername) {
    return redirect(`/claim-username?desiredUsername=${encodeURIComponent(desiredUsername)}`);
  }

  if (!page) {
    return redirect('/claim-username');
  }

  // Page -> plain object for passing to client components
  const leanPage = JSON.parse(JSON.stringify(page));

  // Fetch related collections in parallel
  const [education, workExperience, projects] = await Promise.all([
    Education.find({
      owner: session?.user?.email,
      pageUri: leanPage.uri,
    }).lean(),
    WorkExperience.find({
      owner: session?.user?.email,
      pageUri: leanPage.uri,
    }).lean(),
    Project.find({
      owner: session?.user?.email,
      pageUri: leanPage.uri,
    }).lean(),
  ]);

  // Convert to plain JSON-safe objects
  const educationPlain = JSON.parse(JSON.stringify(education || []));
  const workExperiencePlain = JSON.parse(JSON.stringify(workExperience || []));
  const projectsPlain = JSON.parse(JSON.stringify(projects || []));

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {/* Header Section with Page URL */}
      <AccountHeader uri={leanPage.uri} />

      <div className="space-y-6 w-full">
        <PageSettingsForm page={leanPage} user={session.user} />
        <PageRolesForm page={leanPage} />
        <PageButtonsForm page={leanPage} user={session.user} />
        <PageLinksForm page={leanPage} user={session.user} />
        <PageSummaryForm page={leanPage} user={session.user} />

        <PageWorkExperienceForm
          page={leanPage}
          user={session.user}
          initialWorkExperience={workExperiencePlain}
        />

        <PageProjectForm
          page={leanPage}
          initialProjects={projectsPlain}
        />

        <PageEducationForm page={leanPage} initialEducation={educationPlain} />

        <PageSkillsForm page={leanPage} initialSkills={leanPage.skills || []} />
      </div>
    </div>
  );
}
